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

2.  **Expected Outcome**:
    -  Currently, the code does not pass the tests implemented. The display name for the post we create in the test is not changed automatically when we only run the function create the post, so the assert statement for checking the display name does not pass. However, the name of the post was displayed as "Anonymous User" when we manually tested it on the NodeBB website
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
 

# User Instruction for Instructor group

This guide provides detailed instructions on how to use and user test the new Instructor group feature, as well as an overview of the automated tests associated with this feature.

### Using the Instructor group

1.  **Setup**:
    
    -   Ensure you have the latest version of the system installed and all relevant dependencies.
    -   To use this feature, do **not** run npm test before running NodeBB.
    -   Instructor should display on certain pages by default.
2.  **Inviting Members and Assigning Them to Instructor**:
    
    -   Navigate to the User page in NodeBB.
    -   Here, click on the green "Invite" button.
    -   In the "Emails:" type box, type in the email(s) of the person(s) you would like to invite to register for NodeBB and become an Instructor.
    -   In the "Groups to be joined when invite is accepted:" section below, click on "Instructor" so that it is highlighted.
    -   Next, click on the blue "Invite" button and the user will be sent an email with further instructions.
3.  **Registering as an Instructor**:
    
    -   When you receive an email invitation from NodeBB, click the button provided in it to register.
    -   Enter your desired username and password, then confirm your password.
    -   In the "Account Type:" drop-down selection menu, select "Instructor".
    -   Click the blue "Register Now" button to confirm your registration.
    -   Follow the rest of the registration steps as normal.
3.  **Viewing Members of Instructor and Assigning and Removing Already Existing Members**:
    
    -   Ensure you have admin access in order to do this.
    -   Navigate to the "Admin" menu.
    -   Click on "Manage" and in the drop-down selection menu, select "Admins & Mods".
    -   Here, you can view all the members that are part of the Instructor group.
    -   You can remove a member from Instructor by clicking the "X" button next to the tag of the user name of the member.
    -   To add a member, type their name into the "add-instructor" text box and hit the "enter" key on your keyboard.

#### User Testing the Feature:

1.  **Initial Setup (N/A)**:
   
    -  Navigate to the NodeBB repository
    -  Run `npm run test` in a terminal
3.  **Expected Outcome**:
    
    -   Currently, at least one test fails when `npm run test` is entered into the terminal, typically something involving plugins. Operation of the website         works fine before tests. After the tests are ran and failed, plugins no longer load when you revisit the website without building NodeBB again.

#### Automated Tests:

-   **Location**: The automated tests for this feature can be found in the `test/groups.js` file, with the lines explicitly altered for accomodation of          Instructor being on lines *61 to 69*, *89 to 98*, *139 to 146*, *684 to 691*. Otherwise, many of the tests already test all groups that are created,         including Instructor.
    
-   **Description**:
    
    -   The test, titled `'should list the groups present'`, checks if the system correctly lists all groups that were created.
    -   The test, titled `'should return the groups when search query is empty'`, checks if the system correctly lists all groups that were created when the         search query is empty.
    -   The test, titled `'should add user to Instructor group'`, checks if the system correctly adds users as a member of the Instructor group.
-   **Why These Tests are Sufficient**:
    
    -   The test checks that the system acknowledges the presence of Instructor in general when created.
    -   The test checks that the system acknowledges the presence of Instructor when using the search function.
    -   The tests check that the system acknowledges Instructor is a legitimate group that members can be added to.
    -   The rest of the tests automatically perform standard checks that most or all groups created in the test file go through.
