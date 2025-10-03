# Feature Specification: Web–POS Communication Service

**Feature Branch**: `002-title-web-pos`  
**Created**: 2025-10-02  
**Status**: Draft  
**Input**: User description: "Implement bidirectional communication layer between platform Web backend and external POS system enabling reliable synchronization of order lifecycle states and stock availability with configurable business rules, automated timeouts, retry & dead-letter handling, logging and observability." 

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
An operations manager needs the platform to stay in near-real-time alignment with the Point‑of‑Sale (POS) system so that orders placed online are actioned correctly in-store and stock displayed online reflects actual availability, reducing manual reconciliation and preventing overselling.

### Supporting User Stories
1. As an operations manager, I need pending orders that are not actioned by the POS within an agreed time to automatically move forward or be escalated so customers are not left waiting indefinitely.
2. As an administrator, I need to view failed or delayed synchronization events and reprocess them so I can restore consistency without database intervention.
3. As a customer, I expect the order status I see online to reflect what is happening in the physical fulfillment process.
4. As a compliance/audit reviewer, I need a chronological trail of all external state changes and decisions.
5. As inventory staff, I need the online catalogue to display only a safe, configurable portion of the physical stock to avoid overselling while still stimulating demand.

### Acceptance Scenarios
1. Given a new order is created online while the POS-managed mode is active, When the platform emits an order-created event, Then the order remains in Pending until an authoritative acceptance or rejection update is received OR the timeout passes (in which case only an admin notification is sent and the state does NOT auto-advance).
2. Given an order is Pending and the timeout threshold elapses with no external response, When the timeout job runs, Then the system sends an email notification to admin users and leaves the order in Pending awaiting manual action.
3. Given an order status update arrives from the POS that conflicts with an already terminal state (e.g., Completed), When reconciliation logic evaluates it, Then the conflicting update is rejected and an exception record is logged for review.
4. Given stock in the POS changes, When a stock update message is received, Then the mirrored stock quantity and displayed derived quantity (after percentage adjustment) are updated and visible to product consumers.
5. Given a message delivery initially fails due to transient conditions, When retry policy completes successfully, Then the final log shows successful outcome and no dead-letter entry is created.
6. Given a message permanently fails after all retries, When the dead-letter list is queried by an administrator, Then the failed item appears with root cause metadata and is available for manual reprocessing.
7. Given configuration values are changed (e.g., stock display percentage), When the next applicable calculation occurs, Then derived values follow the new configuration without code deployment.
8. Given an external system attempts to send a duplicate order status update, When idempotency safeguards detect prior processing, Then the duplicate is acknowledged without altering business state and an idempotent hit is logged.

### Edge Cases
- External system sends status regression (e.g., Out for Delivery → Processing) → System blocks unless order is internal-managed and an authorized user explicitly performs allowed regression.
- Order update arrives after the order has been cancelled by user → Update ignored; audit record created referencing late arrival.
- Stock update with negative or implausible quantity → Behavior depends on configuration: if negative stock disallowed reject & flag; if allowed, cap at configured minimum (e.g., 0) or store negative per setting.
- Burst of high-frequency stock updates for same product → Only most recent authoritative value should be applied; earlier ones superseded.
- Dead-letter queue growth exceeds configurable threshold → System emits admin notification (channel email) for intervention.
- Timeout email and late acceptance arrive nearly together → Acceptance proceeds; notification remains as historical alert (no state auto-advance anyway).
- Callback API key invalid or missing → Reject, log security incident, generic error response.
- Duplicate order created message due to upstream retry → Idempotent; single business record persists.

---

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST maintain a canonical order lifecycle supporting at minimum: Pending, Rejected, Processing, Out For Delivery, Completed, Cancelled.
- **FR-002**: System MUST record every external state change attempt (accepted or rejected) with timestamp, source, prior state, and outcome rationale.
- **FR-003**: System MUST support two global operation modes for order control: external‑managed vs internal‑managed (mutually exclusive at any one time).
- **FR-004**: System MUST emit an order-created synchronization event immediately after internal persistence.
- **FR-005**: System MUST process externally supplied order status transitions only if they are valid successors to the current canonical state.
- **FR-006**: System MUST enforce idempotency for external updates using a stable unique identifier so duplicate deliveries do not mutate state twice; idempotency keys MUST be retained and matched for a minimum of 7 days after first use, after which duplicates may be treated as new.
- **FR-007**: System MUST apply a configurable timeout for orders remaining in Pending and upon expiration ONLY notify administrators (no automatic state transition).
- **FR-008**: System MUST allow configuration of which customer-visible statuses permit customer-initiated cancellation.
- **FR-009**: System MUST provide a mechanism to safely ignore late-arriving external updates once an order is terminal.
- **FR-010**: System MUST mirror external stock quantities and apply a configurable global percentage reduction when presenting available stock.
- **FR-011**: System MUST allow per-item override of the stock presentation percentage, defaulting to the global if unset.
- **FR-012**: System MUST maintain the distinction between logical displayed stock and authoritative mirrored quantity.
- **FR-013**: System MUST accept real-time incremental stock updates and also support scheduled or on-demand full resynchronization.
- **FR-014**: System MUST support a configuration toggle governing whether negative resulting stock values are permitted; if disabled, such updates are rejected with audit logging; if enabled they are stored as provided.
- **FR-015**: System MUST implement a structured retry policy for failed outbound or inbound message handling attempts (minimum configurable attempts and backoff interval).
- **FR-016**: System MUST route permanently failed synchronization items to a dead-letter register for administrative review and manual reprocessing.
- **FR-017**: System MUST expose an administrative view/list of dead-lettered items including cause summary and original payload reference.
- **FR-018**: System MUST allow manual reprocessing of individual dead-letter entries with outcome logging (success/failure and operator identity).
- **FR-019**: System MUST provide configuration-driven toggles without requiring redeployment (e.g., mode switch, timeout duration, stock percentage, cancellation statuses).
- **FR-020**: System MUST log all synchronization outcomes (success, soft failure, hard failure) in an append-only audit channel.
- **FR-021**: System MUST protect inbound external callbacks via generated API keys (token-based authentication).
- **FR-022**: System MUST reject any unauthenticated external callback and not disclose internal validation details in response bodies.
- **FR-023**: System MUST include full order and customer data in external messages (all data permitted for this release).
- **FR-025**: System MUST provide configurable numeric alert thresholds for excessive pending duration, dead-letter accumulation, retry saturation, and stock divergence.
- **FR-028**: System MUST prevent regression transitions except when the order is internal-managed and an authorized user invokes a manual regression.
- **FR-029**: System MUST maintain a monotonic version number per order update attempt to arbitrate competing updates.
- **FR-032**: System MUST allow on-demand full inventory refresh initiated by an authorized operator and indicate progress/completion.
- **FR-034**: System MUST ensure functional behaviors are testable through automated scenarios (unit + integration).
- **FR-035**: System MUST allow administrators to configure whether negative stock is allowed globally.

Removed (out of scope for this release): FR-024, FR-026, FR-027, FR-030, FR-031, FR-033.

### Non-Functional / Quality Requirements
- **NFR-003**: Dead-letter rate post-retry should remain below 0.5% of total processed synchronization attempts per rolling 24h.
- **NFR-006**: System must remain operable (degraded mode) when external system is unavailable; no cascading failure to core order placement.
- **NFR-007**: Sensitive fields must not be persisted in plaintext within audit or dead-letter storage (only references or masked values).
- **NFR-008**: Observability artifacts (metrics / logs) must allow segmentation by outcome (success, retry, dead-letter) and message category (order, stock).
- **NFR-009**: All configuration reads should be effectively cached ensuring negligible added latency to transactional flows.

Removed: NFR-001, NFR-002, NFR-004, NFR-005.

### Assumptions
- Single external POS authority for this phase.
- Event streaming and callback network channels are reasonably reliable but may occasionally delay or duplicate messages.
- External system can provide rejection reasons for declined orders.

### Out of Scope (Confirming Boundaries)
- Customer-facing real-time push notifications beyond existing notification channels.
- Payment processing changes.
- Returns/refunds workflow expansion beyond alignment with post-completion status.

### Clarification Resolutions
- Authentication mechanism: Generated API keys (token-based) for POS callbacks.
- Retention period for audit & dead-letter: No archival/purge requirement in this release.
- Alert thresholds: All numeric thresholds configurable (no fixed defaults mandated here).
- Timeout precedence: When timeout exceeded → email notification only; late acceptance still processed.
- Stock rounding: Round down after applying percentage.
- Manual regression overrides: Required (only allowed in internal-managed mode).
- Data fields in external messages: All order & customer data allowed for this release.
- Reconciliation reporting cadence: Not required in this release.
- Stock divergence remediation: Automatic full sync.

## Clarifications
### Session 2025-10-02
- Q: What should be the retention / expiry period for idempotency keys (after which a previously used key is no longer guaranteed to be treated as a duplicate)? → A: 7 days

---

### Key Entities
- **Order**: Canonical business order record including current state, timestamps for lifecycle events, controlling mode flag, version sequence, cancellation eligibility markers.
- **Order State Change Record**: Immutable audit entry capturing attempted and successful state transitions, actor (external/internal/system), reason, idempotency reference.
- **Stock Mirror Record**: Representation of current external authoritative stock quantity alongside last update timestamp and derived displayed quantity (percentage-adjusted).
- **Configuration Setting**: Name/value (typed) governing behavioral toggles (mode selection, timeout durations, allowed cancellations, stock percentages).
- **Synchronization Message Log**: Ledger of outbound/inbound synchronization attempts recording category (order/stock), reference IDs, outcome (success/retry/failed), latency metrics, and correlation identifiers.
- **Dead-Letter Item**: Persisted failed synchronization payload reference plus failure reason summary, retry count, operator reprocess metadata.
- **Reconciliation Report Snapshot**: Generated summary enumerating discrepancies between canonical platform state and latest known external state, timestamped for audit.

---

## Review & Acceptance Checklist
### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain (idempotency key retention defined: 7 days)
- [x] Requirements are testable and unambiguous where not flagged
- [x] Success criteria are measurable (see metrics and NFRs)
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
