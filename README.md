
# From handlers/register.php
#### SELECT customer_name FROM customer WHERE customer_name = ?
- #####  Purpose: This command checks if a customer's name already exists in the customer table.
- ##### How it works: Before a new user can register, this query is run to ensure that their chosen name is unique. The ? is a placeholder for the name the user enters in the registration form. If the query finds any rows, it means the name is already taken, and the user will be prompted to choose a different one.

#### SELECT username FROM customer WHERE username = ?
- ##### Purpose: This command checks if a username is already taken.
- ##### How it works: Similar to the previous command, this query ensures that every user has a unique username. It searches the customer table for the username provided during registration. If a match is found, the registration process is halted, and the user is asked to pick a new username.

#### INSERT INTO customer (customer_name, address, username, password_hash) VALUES (?, ?, ?, ?)
- ##### Purpose: This command creates a new user account.
- ##### How it works: Once the username and customer name are confirmed to be unique, this query inserts a new record into the customer table. The ? placeholders are filled with the user's full name, address, chosen username, and a securely hashed password.
-- --
# From handlers/cake_login.php
#### SELECT customer_id, customer_name, username, password_hash FROM customer WHERE username = ?
- ##### Purpose: This command retrieves a user's data from the customer table to verify their login credentials.
- ##### How it works: When a user tries to log in, this query fetches the account details associated with the entered username. The application then compares the provided password against the password_hash stored in the database to confirm the user's identity. If they match, the user is successfully logged in.
-- --
# From handlers/cake.php
#### SELECT * FROM users WHERE username = ? AND password = ?
- ##### Purpose: This command logs a user in by checking their username and password.
- ##### How it works: This is another login query that checks for a matching username and password in the users table.
-- --
# From handlers/save_cake.php
#### INSERT INTO cake (artist_id, cake_design, layers, toppings, layers_type) VALUES (?, ?, ?, ?, ?)
- ##### Purpose: This command saves a new, custom-designed cake to the database.
- ##### How it works: When a user designs a cake, this query stores all of its specifications—including the artist, design, number of layers, toppings, and layer types—in the cake table. This allows the order to be processed with the correct details.
-- --
# From handlers/get_artists.php
#### SELECT artist_id, artist_name FROM artist ORDER BY artist_name ASC
- ##### Purpose: This command retrieves a list of all available artists.
- ##### How it works: This query fetches the ID and name of every artist from the artist table and sorts them in alphabetical order. This list is then displayed to the user, allowing them to choose their preferred artist for their cake design.
- -- --
# From handlers/delivery_cake.php
#### INSERT INTO deliveries (username, address, phone) VALUES (?, ?, ?)
- ##### Purpose: This command saves the delivery details for an order.
- ##### How it works: After an order is placed, this query inserts the user's username, delivery address, and phone number into the deliveries table. This ensures the cake is delivered to the right location.
-- --
# From handlers/submit_order.php
#### SELECT promotion_id FROM promotion WHERE promotion_name = ? LIMIT 1
- ##### Purpose: This command validates a promotional code entered by the user.
- ##### How it works: If a user enters a promo code, this query checks the promotion table to see if it's a valid code. LIMIT 1 ensures that only one result is returned, even if there are duplicate promotion names. If the code is valid, the corresponding promotion_id is applied to the order.
- 
#### INSERT INTO orders (customer_id, cake_id, promotion_id, delivery_date, delivery_type, payment, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)
- ##### Purpose: This command finalizes and records an order in the database.
- ##### How it works: This is the final step in the ordering process. The query inserts all the essential order details—such as the customer's ID, the cake's ID, any promotions, delivery information, and payment method—into the orders table. This creates a complete and permanent record of the transaction.
