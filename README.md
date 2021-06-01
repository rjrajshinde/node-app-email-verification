# node-app-email-verification
This is Node-app with database MongoDB

Here we verify the user whoever register here by sending the email with 4 character OTP
then user have to fill the otp with email after that he can login to the app
or else the error message will be shown as "Account is not verified"
We also provide the functionality for "forget password" 
when we click on forgot password it we create a token and send it with 
the link to reset the password.

NPM Package

for authentication - express-session
for otp generation - otp-generator
for password encryption - bcrypt
for create reset token - rand-token
