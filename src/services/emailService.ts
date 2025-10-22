interface InviteEmailParams {
  recipientEmail: string;
  recipientRole: string;
  inviterName: string;
  inviterEmail: string;
}

// This file is no longer used for sending invite emails
// The PeoplePage now directly calls the API endpoints:
// - /user/add/member (to add a member)
// - /user/verify/member (to send verification email)

// Keeping this file for potential future use or reference
export const sendInviteEmail = async (): Promise<boolean> => {
  // This function is deprecated
  console.warn("sendInviteEmail is deprecated. Use API endpoints directly.");
  return true;
};

export const sendInviteEmailViaEmailJS = async (): Promise<boolean> => {
  // This function is deprecated
  console.warn(
    "sendInviteEmailViaEmailJS is deprecated. Use API endpoints directly."
  );
  return true;
};
