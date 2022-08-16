# Rentago

Rentago lets you rent your apartment in an approachable way. It allows you to add address using Google places api, and show it on the map.
You can change the availability of the apartment too in an instant.

## Roles:

### 1. Client:

A client can only view apartments on a map, and also its details.

### 2. Realtor:

A realtor can do all of what a client can do, but it can also add apartments, and update and delete its apartments.

### 3. Admin

An admin can add, and update all of the apartments. It can also add, and update users.

## Development

### Tech Stake:

- React
- Typescript
- Redux Toolkit
- Chakra UI
- Axios
- NestJs
- Postgresql
- Typeorm
- Passport js
- Jest
- React Testing Library

## How to run:

### Client:

- `cd client`

- `yarn start`

- To run tests, `yarn test`

### Server:

- `cd server`

- `docker-compose up`

- `yarn run start:dev`

- The server will running at `http://localhost:3001`
