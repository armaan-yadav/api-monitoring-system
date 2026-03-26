# api-monitoring-system

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Architecture
Modular Monolith -> combination of both microserviced and monolith
Each service is sub-divided into further parts
controller -> handles the core logic
reposiroty -> handles the database calls & interaction
routes -> responsible for the routes fo the service
validation -> takes  care of the validation 
services -> has the  business related logic
dependencies -> 

Http Request -> bun server -> Router -> Controller -> Services -> Repository
(Single Responsibility Principle is handles from SOLID)

Consider  Controller and Services :
-> one way to use service inside the controller is by directly importing the service inside the controller
-> no cons  but it makes the system Tightly Coupled
how do we make it loosely coupled?
by using dependencies : a container which imports all the services, repositories and validation
now the controller uses the above form the dependencies; usko farq nayi padta tum usko kya dere ho
everything is handled inside the dependencies container (Manager sort of)

The above thing handles the Dependency Injection from SOLID principles
(The high level modules should not be dependent on low level modules)


## Data Models

![alt text](diagrams/models.png)
![alt text](diagrams/endpoint_metrices.png)
