import { AuthController } from '../controllers/authController';
import MongoUserRepository from '../repositories/userRepository';
import AuthService from '../services/authService';

class Container {
    static init() {
        const repositories = { userRepository: new MongoUserRepository() };

        const services = { authService: new AuthService(repositories.userRepository) };

        const controllers = {
            authController: new AuthController(services.authService),
        };

        return {
            repositories,
            services,
            controllers,
        };
    }
}

const dependencies = Container.init();
export { Container };
export default dependencies;
