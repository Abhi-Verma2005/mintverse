pub mod signup;
pub mod types;
pub mod user;

// Re-export the signup function so it's easier to use
pub use signup::signup_handler;


