# Carbook

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.1.

## Prerequisites

- Node.js (version 18 or later is recommended)
- npm (comes with Node.js)

## Installation

Install dependencies for the Angular frontend and the JSON server backend:

```bash
npm install
```

If you already have dependencies installed but want to ensure a clean setup, consider removing the `node_modules` folder and `package-lock.json` before running `npm install`.

## Running the application

The project uses two processes: one for the Angular frontend and one for the JSON server backend. Open two terminal windows or tabs and run the following commands from the project root:

1. **Start the frontend**

   ```bash
   npm start
   ```

   The Angular app will start at `http://localhost:4200/` and reload automatically when you edit source files.

2. **Start the backend (JSON server)**

   ```bash
   npm run json-server
   ```

   The JSON server will serve API endpoints based on `db.json` (by default at `http://localhost:3000/`).

Make sure both processes stay running to use the application locally.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
