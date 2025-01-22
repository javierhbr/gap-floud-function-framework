    - Create a weather directory and add all the changes there

    - PUT endpoint `/weather/:id` to update the temperature.
    - GET endpoint `/weather/:id` to get the temperature.
    - POST endpoint `/weather` to save the temperatures.
    - Create services using ports and adapters to:
        - Get data from a weather API given a date and write it into Firestore DB.
        - Send an event to a Pub/Sub topic if the temperature is more than 100.
        - Return a list of weather variables for the given date.
        - Add a new attributes to `businessData` on each service logic used
    - Show the usage of Dependency Injection.
    - Add a Map instance to collect business data which be new on every request.
    - Create a `WeatherValidation` class that uses the above services from dependency injection and includes a method `checkByDate(date: Date)`.
    - Ensure the `checkByDate` method is called by `weatherHandlerGet` or `weatherHandlerPost`.
    - Add a custom HTTP header attribute `x-date` in the response.
    - Ensure fast performance and quick cold start times.
    -  wrapping the response to send on a `after` method of a middleware

**Deliverables**:

- Include full code for all specially Middleware , Services, and and examples
- Provide step-by-step implementation details.
