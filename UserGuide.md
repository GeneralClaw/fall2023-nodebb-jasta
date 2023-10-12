# User Instruction for Default Emailer System

This guide provides detailed instructions on how to use and user test the new emailer configuration feature, as well as an overview of the automated tests associated with this feature.

#### Using the New Emailer Configuration Feature:

1.  **Setup**:
    
    -   Ensure you have the latest version of the system installed and all relevant dependencies, specifically `nodemailer`
2.  **Configuration (N/A)**:
    
    -   Navigate to the emailer configuration settings in the `Admin Control Panel`
    -   Notice the frontend UI does not contain email server configuration, since this should be handled by default by this feature
3.  **Sending Emails**:
    
    -   Navigate to an area of the app that sends emails, whether test emails from the `Admin Control Panel` or invitations to actual users.
    -   Choose your desired template and fill in the necessary details.
    -   Send the email and check the receiver's inbox for the email.

#### User Testing the Feature:

1.  **Initial Setup (N/A)**:
    
    -   Do not change the configuration, there are tests that cover both that the default config runs and the ability for custom configs to be using the `nodebb-custom-smtp-test` tag for service configurations.
2.  **Expected Outcome**:
    
    -   If the configuration was not set to `'nodebb-custom-smtp-test'`, default settings should have been applied.
    -   The SMTP user should be `'jasta3629@gmail.com'` , the service should be `'gmail'`, and the email system should work as expected.

#### Automated Tests:

-   **Location**: The automated tests for this feature can be found in the `test/emailer.js` file on lines *72 to 85*.
    
-   **Description**:
    
    -   The test, titled `'should set the default mailer configuration correctly'`, checks if the system correctly sets the default emailer configuration when it is not set to `'nodebb-custom-smtp-test'` (this tag is only used for testing custom configurations that aren't the default).
-   **Why These Tests are Sufficient**:
    
    -   The test checks all aspects of the default configuration setting, ensuring that every part of the configuration is correctly applied.
    -   The test interacts with the `Emailer.setupFallbackTransport` method directly, ensuring that any changes to this method are verified by the test.
    -   The usage of assertions ensures that any discrepancies in the default configuration will result in a failed test.
