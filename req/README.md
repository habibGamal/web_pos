# Configurable Business Logic - Project Overview

## Quick Summary

This specification outlines a comprehensive system for managing orders between a Web application and POS system with configurable business rules, using a hybrid API + Kafka communication approach.

## Key Features

### 1. **Flexible Order Management**
- Choose between POS-managed or Web-managed orders
- Configurable order confirmation workflows
- New order status flow: PENDING → REJECTED/PROCESSING → OUT_FOR_DELIVERY → COMPLETED

### 2. **Smart Stock Management**
- Per-product stock configuration (stockable or not)
- Choose stock source: POS or Web inventory
- Configurable stock indicators with display percentage
- Stock reservation and consumption logic

### 3. **Business Hours Control**
- Accept orders 24/7 or within specific hours
- Per-day configurable working hours
- Timezone support
- Queue or reject orders outside hours

### 4. **Notification System**
- Admin email notifications for critical events
- User notifications for order status changes
- Configurable notification preferences
- Multiple notification channels (email, push, database)

### 5. **POS Integration**
- Kafka-based event streaming
- API callbacks for real-time updates
- Stock synchronization
- Order confirmation/rejection workflow

## Architecture Overview

```
┌──────────┐           ┌──────────┐           ┌──────────┐
│   Web    │  ─────►   │  Kafka   │  ─────►   │   POS    │
│  (Laravel)│  Events  │  Broker  │  Events  │  System  │
└──────────┘           └──────────┘           └──────────┘
     │                       │                       │
     │                       │                       │
     └───────────────────────┴───────────────────────┘
              API Callbacks & Stock Updates
```

## New Order Status Flow

```
Order Created
    ↓
[PENDING] ─── Admin/POS Review
    ├─→ Approved → [PROCESSING] → [OUT_FOR_DELIVERY] → [COMPLETED]
    ├─→ Rejected → [REJECTED]
    └─→ Cancelled → [CANCELLED]
```

## Configuration Groups

| Group | Purpose |
|-------|---------|
| **Order Management** | Order manager type, confirmation rules, cancellation |
| **Stock Management** | Stock source, reservation, consumption timing |
| **Business Hours** | Working hours, timezone, order acceptance rules |
| **Notifications** | Admin/user notification preferences |

## Documentation

- **[Implementation Plan](./implementation-plan.md)** - Detailed technical implementation guide
- **[Critical Questions](./implementation-plan.md#6-critical-questions--decisions)** - Key decisions needed

## Timeline

- **Phase 1-2**: Foundation & Order Flow (4 weeks)
- **Phase 3-4**: Stock & POS Integration (4 weeks)
- **Phase 5-6**: Business Hours & Notifications (2 weeks)
- **Phase 7**: Testing & Documentation (2 weeks)
- **Total**: 12 weeks

## Critical Questions Requiring Decisions

1. **Order Manager Selection**: Global, per-product, or hybrid approach?
2. **Stock Reservation Timing**: Immediate or on confirmation?
3. **POS Timeout Behavior**: Auto-confirm, auto-reject, or manual intervention?
4. **Stock Display Strategy**: Exact, percentage, or simple in/out stock?
5. **User Cancellation Rules**: Which statuses allow cancellation?
6. **Business Hours Behavior**: Queue, reject, or accept outside hours?
7. **Multiple POS Systems**: Single or multiple POS locations?
8. **Stock Sync Frequency**: Real-time, periodic, or hybrid?

## Next Steps

1. Review implementation plan
2. Answer critical questions
3. Define POS API contract with POS team
4. Set up Kafka infrastructure
5. Begin Phase 1 development

## Key Benefits

✅ **Flexibility**: Adapt business logic without code changes
✅ **Scalability**: Handle growing order volumes
✅ **Reliability**: Robust error handling and retry mechanisms
✅ **Visibility**: Complete order lifecycle tracking
✅ **Integration**: Seamless POS communication
✅ **User Experience**: Clear order status and notifications

## Technical Stack

- **Backend**: Laravel 11, PHP 8.4
- **Message Queue**: Apache Kafka
- **Database**: MySQL
- **Frontend**: Next.js 15, GraphQL
- **Admin Panel**: Filament v3
- **Notifications**: Laravel Notifications, Push

## Files in this Specification

- `README.md` - This overview document
- `implementation-plan.md` - Detailed implementation guide with phases, decisions, and technical specs

---

**Status**: Draft - Pending Review
**Last Updated**: October 2, 2025
