export const getAuthErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already in use. Please use a different email.";
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
  }
};
