/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment UserFields on User {\n    id\n    name\n    email\n    email_verified\n    phone\n    locale\n    is_admin\n    avatar\n    full_name\n    initials\n    has_social_accounts\n    linked_providers {\n      provider\n      provider_id\n    }\n  }\n": typeof types.UserFieldsFragmentDoc,
    "\n  query Me {\n    me {\n      ...UserFields\n    }\n  }\n": typeof types.MeDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  mutation SocialLogin($input: SocialLoginInput!) {\n    socialLogin(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n": typeof types.SocialLoginDocument,
    "\n  mutation Logout {\n    logout {\n      success\n      message\n    }\n  }\n": typeof types.LogoutDocument,
    "\n  mutation ForgotPassword($input: ForgotPasswordInput!) {\n    forgotPassword(input: $input) {\n      message\n    }\n  }\n": typeof types.ForgotPasswordDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      success\n      message\n    }\n  }\n": typeof types.ResetPasswordDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      success\n      message\n    }\n  }\n": typeof types.ChangePasswordDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...UserFields\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      message\n      verified\n    }\n  }\n": typeof types.VerifyEmailDocument,
    "\n  mutation ResendVerification($input: ResendVerificationInput!) {\n    resendVerification(input: $input) {\n      success\n      message\n    }\n  }\n": typeof types.ResendVerificationDocument,
    "\n  mutation DeleteAccount {\n    deleteAccount {\n      success\n      message\n    }\n  }\n": typeof types.DeleteAccountDocument,
    "\n  mutation RefreshToken {\n    refreshToken {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n": typeof types.RefreshTokenDocument,
    "\n  query CheckEmailAvailability($email: String!) {\n    checkEmailAvailability(email: $email)\n  }\n": typeof types.CheckEmailAvailabilityDocument,
};
const documents: Documents = {
    "\n  fragment UserFields on User {\n    id\n    name\n    email\n    email_verified\n    phone\n    locale\n    is_admin\n    avatar\n    full_name\n    initials\n    has_social_accounts\n    linked_providers {\n      provider\n      provider_id\n    }\n  }\n": types.UserFieldsFragmentDoc,
    "\n  query Me {\n    me {\n      ...UserFields\n    }\n  }\n": types.MeDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n": types.RegisterDocument,
    "\n  mutation SocialLogin($input: SocialLoginInput!) {\n    socialLogin(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n": types.SocialLoginDocument,
    "\n  mutation Logout {\n    logout {\n      success\n      message\n    }\n  }\n": types.LogoutDocument,
    "\n  mutation ForgotPassword($input: ForgotPasswordInput!) {\n    forgotPassword(input: $input) {\n      message\n    }\n  }\n": types.ForgotPasswordDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      success\n      message\n    }\n  }\n": types.ResetPasswordDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      success\n      message\n    }\n  }\n": types.ChangePasswordDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...UserFields\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      message\n      verified\n    }\n  }\n": types.VerifyEmailDocument,
    "\n  mutation ResendVerification($input: ResendVerificationInput!) {\n    resendVerification(input: $input) {\n      success\n      message\n    }\n  }\n": types.ResendVerificationDocument,
    "\n  mutation DeleteAccount {\n    deleteAccount {\n      success\n      message\n    }\n  }\n": types.DeleteAccountDocument,
    "\n  mutation RefreshToken {\n    refreshToken {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n": types.RefreshTokenDocument,
    "\n  query CheckEmailAvailability($email: String!) {\n    checkEmailAvailability(email: $email)\n  }\n": types.CheckEmailAvailabilityDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserFields on User {\n    id\n    name\n    email\n    email_verified\n    phone\n    locale\n    is_admin\n    avatar\n    full_name\n    initials\n    has_social_accounts\n    linked_providers {\n      provider\n      provider_id\n    }\n  }\n"): (typeof documents)["\n  fragment UserFields on User {\n    id\n    name\n    email\n    email_verified\n    phone\n    locale\n    is_admin\n    avatar\n    full_name\n    initials\n    has_social_accounts\n    linked_providers {\n      provider\n      provider_id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      ...UserFields\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      ...UserFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SocialLogin($input: SocialLoginInput!) {\n    socialLogin(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SocialLogin($input: SocialLoginInput!) {\n    socialLogin(input: $input) {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout {\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout {\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ForgotPassword($input: ForgotPasswordInput!) {\n    forgotPassword(input: $input) {\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ForgotPassword($input: ForgotPasswordInput!) {\n    forgotPassword(input: $input) {\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...UserFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      ...UserFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      message\n      verified\n    }\n  }\n"): (typeof documents)["\n  mutation VerifyEmail($input: VerifyEmailInput!) {\n    verifyEmail(input: $input) {\n      message\n      verified\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResendVerification($input: ResendVerificationInput!) {\n    resendVerification(input: $input) {\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ResendVerification($input: ResendVerificationInput!) {\n    resendVerification(input: $input) {\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteAccount {\n    deleteAccount {\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteAccount {\n    deleteAccount {\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RefreshToken {\n    refreshToken {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RefreshToken {\n    refreshToken {\n      access_token\n      token_type\n      expires_in\n      user {\n        ...UserFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CheckEmailAvailability($email: String!) {\n    checkEmailAvailability(email: $email)\n  }\n"): (typeof documents)["\n  query CheckEmailAvailability($email: String!) {\n    checkEmailAvailability(email: $email)\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;