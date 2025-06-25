# MyrentAbuja Backend API Documentation

This document outlines the available API endpoints for the MyrentAbuja platform, designed to connect tenants and landlords directly.

---

## Authentication

### 1. User Registration

Registers a new user with either a `tenant` or `landlord` role.

* **Endpoint:** `POST /api/auth/signup`
* **Request Body:**
    ```json
    {
      "role": "tenant" | "landlord",
      "name": "string",
      "dateOfBirth": "YYYY-MM-DD",
      "email": "string",
      "password": "string",
      "phone": "string",
      "address": "string",         // Required for 'landlord' role
      "nin": "string",             // Required for 'landlord' role
      "maritalStatus": "string",   // Required for 'tenant' role
      "passportPhotoUrl": "string" // Required for 'landlord' role
    }
    ```
* **Response:**
    ```json
    {
      "userId": "string",
      "message": "User registered successfully. Please verify your email."
    }
    ```

### 2. User Login

Authenticates a user and returns a JSON Web Token (JWT) for subsequent authenticated requests.

* **Endpoint:** `POST /api/auth/login`
* **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
* **Response:**
    ```json
    {
      "token": "jwt-token-string",
      "user": {
        "id": "string",
        "role": "tenant" | "landlord" | "admin",
        "name": "string",
        "email": "string"
      }
    }
    ```

### 3. Get User Profile

Retrieves the profile details of the authenticated user.

* **Endpoint:** `GET /api/users/me`
* **Headers:**
    * `Authorization`: `Bearer <token>` (User's JWT)
* **Response:**
    ```json
    {
      "id": "string",
      "role": "tenant" | "landlord" | "admin",
      "name": "string",
      "dateOfBirth": "YYYY-MM-DD",
      "email": "string",
      "phone": "string",
      "address": "string",         // Present if role is 'landlord'
      "nin": "string",             // Present if role is 'landlord'
      "maritalStatus": "string",   // Present if role is 'tenant'
      "passportPhotoUrl": "string" // Present if role is 'landlord'
    }
    ```

---

## Property Management (Landlord Features)

### 4. Get All Properties

Retrieves a list of all properties. For landlords, this typically includes all properties they own. For tenants, this should be filtered by properties `verified: true`.

* **Endpoint:** `GET /api/properties`
* **Headers:**
    * `Authorization`: `Bearer <token>` (User's JWT)
* **Response:**
    ```json
    [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "location": "string",
        "price": "number",
        "leaseDurationMonths": "number",
        "isOccupied": "boolean",
        "ownershipCertificateToken": "string",
        "images": ["url1", "url2"],
        "rentExpiryDate": "YYYY-MM-DD",
        "verified": "boolean"
      },
      // ... more properties
    ]
    ```

### 5. Create a Property Listing

Allows a landlord to list a new property for rent. New properties are initially unverified.

* **Endpoint:** `POST /api/properties`
* **Headers:**
    * `Authorization`: `Bearer <token>` (Landlord's JWT)
* **Request Body:**
    ```json
    {
      "title": "string",
      "description": "string",
      "location": "string",
      "price": "number",
      "leaseDurationMonths": "number",
      "ownershipCertificateToken": "string",
      "images": ["url1", "url2"] // Array of image URLs
    }
    ```
* **Response:**
    ```json
    {
      "id": "string",
      "message": "Property listed successfully, pending admin verification."
    }
    ```

### 6. Update Property Status

Allows a landlord to update the occupancy status of their property.

* **Endpoint:** `PATCH /api/properties/:propertyId/status`
* **Headers:**
    * `Authorization`: `Bearer <token>` (Landlord's JWT)
* **Request Body:**
    ```json
    {
      "isOccupied": "boolean" // true to mark as occupied, false for vacant
    }
    ```
* **Response:**
    ```json
    {
      "message": "Property status updated successfully."
    }
    ```

---

## Tenant Features

### 7. Search Properties

Allows tenants to search for properties based on various criteria. Only properties with `verified: true` will be returned.

* **Endpoint:** `GET /api/properties/search`
* **Query Parameters (optional):**
    * `minPrice`: `number` (Minimum price)
    * `maxPrice`: `number` (Maximum price)
    * `location`: `string` (e.g., "Wuse 2, Abuja")
    * `apartmentType`: `string` (e.g., "3-bedroom")
* **Response:**
    ```json
    [
      {
        "id": "string",
        "title": "string",
        "location": "string",
        "price": "number",
        "images": ["url1", "url2"],
        "isOccupied": "boolean"
      },
      // ... more properties
    ]
    ```

### 8. Get Property Details

Retrieves detailed information for a specific property.

* **Endpoint:** `GET /api/properties/:propertyId`
* **Headers:**
    * `Authorization`: `Bearer <token>` (Authenticated user's JWT)
* **Response:**
    ```json
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "location": "string",
      "price": "number",
      "leaseDurationMonths": "number",
      "isOccupied": "boolean",
      "owner": {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string"
      },
      "images": ["url1", "url2"],
      "rentExpiryDate": "YYYY-MM-DD",
      "verified": "boolean" // Indicates if the property is admin-verified
    }
    ```

---

## Messaging

### 9. Send Message

Sends a message from the authenticated user to a specified recipient regarding a property.

* **Endpoint:** `POST /api/messages`
* **Headers:**
    * `Authorization`: `Bearer <token>` (Sender's JWT)
* **Request Body:**
    ```json
    {
      "recipientId": "string", // ID of the user receiving the message
      "propertyId": "string",  // ID of the property related to the message
      "message": "string"      // The message content
    }
    ```
* **Response:**
    ```json
    {
      "messageId": "string",
      "timestamp": "ISO 8601 datetime",
      "message": "Message sent successfully!"
    }
    ```

### 10. Get Messages

Retrieves messages for the authenticated user, optionally filtered by property and/or other participant.

* **Endpoint:** `GET /api/messages`
* **Query Parameters (optional):**
    * `propertyId`: `string` (Filter messages related to a specific property)
    * `participantId`: `string` (Filter messages exchanged with a specific user)
* **Headers:**
    * `Authorization`: `Bearer <token>` (User's JWT)
* **Response:**
    ```json
    [
      {
        "id": "string",
        "senderId": "string",
        "recipientId": "string",
        "propertyId": "string",
        "message": "string",
        "timestamp": "ISO 8601 datetime"
      },
      // ... more messages
    ]
    ```

---

## Admin Endpoints

These endpoints require authentication with an `admin` role token.

### 11. Verify Property Listing

Allows an administrator to change the verification status of a property. Properties must be verified to appear on tenant dashboards.

* **Endpoint:** `PATCH /api/admin/properties/:propertyId/verify`
* **Headers:**
    * `Authorization`: `Bearer <admin-token>` (Admin's JWT)
* **Request Body:**
    ```json
    {
      "verified": "boolean" // Set to `true` to verify, `false` to unverify
    }
    ```
* **Response:**
    ```json
    {
      "message": "Property verification status updated."
    }
    ```

### 12. Get All Users

Retrieves a list of all users in the system, accessible only by administrators.

* **Endpoint:** `GET /api/admin/users`
* **Headers:**
    * `Authorization`: `Bearer <admin-token>` (Admin's JWT)
* **Response:**
    ```json
    [
      {
        "id": "string",
        "role": "tenant" | "landlord" | "admin",
        "name": "string",
        "email": "string",
        "phone": "string" // Added phone based on common user data, removed 'verified' as it's not on users table
      },
      // ... more users
    ]
    ```

---

## Error Handling

All API endpoints return standard HTTP status codes.

* `200 OK` – Successful requests
* `201 Created` – Resource successfully created
* `400 Bad Request` – Validation errors, malformed requests, or invalid input
* `401 Unauthorized` – Authentication failure (e.g., missing or invalid token)
* `403 Forbidden` – Insufficient permissions to access the resource
* `404 Not Found` – Resource does not exist
* `500 Internal Server Error` – An unexpected error occurred on the server

Error responses consistently follow this format:

```json
{
  "error": "Error message describing the problem"
}