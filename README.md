Name: Evan Carlstrom

Time to complete: About 1.5 hours. I initially intended to do this project with vanilla PHP with the PDO extension rather than use a framework, but ran into some Apache configuration issues that caused endpoints to occasionally send back a 404 error response rather than handle requests. In the interest of time I elected to use Node since I've previously built simple APIs with it. In the meantime I also looked into the Apache issues and believe I've figured those out, but felt I was spending too much time on those initially. The 1.5 hour time reflects only the current Node-based version of the project.

List of general steps:

- The first step before coding anything was to lay out the database schema using a *users* table and a *messages* table. This ended up being a somewhat similar idea to a project I've done at work, so I felt that the separated tables approach was the best. In theory the messages could be handled with a JSON column in the *users* table, but this is not particularly scalable and any operations that involve doing more than simply listing out all the data become ghoulish messes of subqueries and JSON operations. For example, the *view_messages* endpoint is handled far more cleanly with a separate messages table. This also allows manipulation of entries in either table with minimal unintended side effects in the other.
- The next step was to start with the */register* endpoint since all other operations require users to exist. This served as a template for the other endpoints; the main idea for all of them is to parse the information in the request body, perform a query based on the requirements, and return both success and failure cases. Once I was able to register users, I could use the same logical flow for all other endpoints.
- I organized the approach into three user and two message operations and ordered the endpoint code in the file as such.
- I completed the other endpoints and verified that specific behaviors were handled correctly, for example the error response for */login* and the exclusion of the requesting user for */list_all_users*.
- After confirming all endpoints worked correctly, I double-checked the formatting of responses and thought about some potential improvements. For example, I added a check to each endpoint that verifies the user has sent all the required information to complete the operation.
- Once this was all complete, I waited until the next day to look at it with a fresh pair of eyes and test all the endpoints through success cases and multiple types of failure cases (a true error vs. incomplete request information, for example) before submitting.

Improvements:

In general most of the improvements would be rather nitpicky or related to security issues that are beyond the scope of a simple test project.

- The naming convention is somewhat inconsistent, for example using *view_messages* and *list_all_users*, especially considering that the users endpoint doesn't technically list all users. Names are also generally better when they're concise nouns, such as *messages* or *users*, as per [this article](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/#h-name-collections-with-plural-nouns). 
- There's only one required error response for the */login* endpoint, but it's probably more helpful to add codes and messages to all errors to assist in troubleshooting. This is the reason I added a couple of error codes and longer-form messages for certain types of errors.
- Security concerns are worth mentioning but again are not really an issue here because the scope of the project is small. Sending passwords as plain text in the JSON objects or not making sure a user is authenticated before getting information from */list_all_users* or *view_messages* would be problematic in a real application, but not here.
- In terms of scalability, at some point *list_all_users* and *view_messages* could return enough data to cause server issues. It would be worth figuring out the best way to paginate or chunk the data before that becomes a potential issue.
