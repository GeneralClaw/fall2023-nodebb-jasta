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


# User Instruction for Anonymous Posts

This guide provides detailed instructions on how to use and user test the new anonymous posts feature, as well as an overview of the automated tests associated with this feature.

#### How to create an anonymous post:

1.  **Setup**:

    -  Ensure you have the latest version of NodeBB installed and built
    -  Login to an account on NodeBB
2.  **Creating Anonymous Posts**:

    -  In NodeBB, navigate to any category (eg. Announcements) and click “New Topic”
    -  In the popup that appears to create a new post, there should be a switch labeled “Anonymous Post?” under the tools bar containing the options for formatting the text of your post
    -  Turn that switch on if you want your new post to be anonymous, and make a post as you would normally do otherwise
    -  If the “Anonymous Post?” button is on, the resulting post should have “Anonymous User” displayed rather than a user’s username
    -  Note that if the account is an admin or a moderator, the name displayed will also show the poster’s username in parentheses after “Anonymous User”

#### User Testing the Feature:

1.  **Initial Setup (N/A)**:
    -  Navigate to the NodeBB repository
    -  Run `npm run test` in a terminal

#### Automated Tests:

-   **Location**: The automated tests for this feature can be found in the `test/posts.js` file starting on line 1237 in the “Anonymous Posts” section of the tests

-   **Description**:

    -   Each of the tests create a post with the isAnonymous field in the postData set to true.
    -   The first test, labeled “should create an anonymous main post” creates a new topic and ensures that the resulting main post has the isAnonymous set to true. It also ensures that the display name is “Anonymous User”
    -   The second test, labeled “should create an anonymous reply” creates a reply under a topic and ensures that the resulting post has the isAnonymous set to true. It also ensures that the display name is “Anonymous User”
    -   The third test, labeled “instructors should still see user name” creates a post as a student and ensures that the resulting post has the isAnonymous set to true. It also ensures that if the user requesting to see the post is an admin or moderator, they will still be able to see the student’s username in the post.
    -   All checks were conducted through assert statements

-   **Why These Tests are Sufficient**:
    -   These tests are sufficient because they check that a post is made correctly, post as a reply or a main post in a topic, when their isAnonymous field is set to true
    -   They also ensure that their display name shows “Anonymous User” when the field "isAnonymous" is true. Given that the field displayname in a post was only changed under the condition that the field “isAnonymous” field is true, all other functions of a post stayed the same. 