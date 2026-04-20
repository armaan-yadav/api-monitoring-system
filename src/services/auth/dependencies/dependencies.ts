import AuthController from '../controllers/authController';
import MongoUserRepository from '../repositories/userRepository';
import AuthService from '../services/authService';

class Container {
    static init() {
        const repository = new MongoUserRepository();

        const service = new AuthService(repository);

        const controller = new AuthController(service);

        return {
            authRepository :repository,
            authService: service,
            authController: controller,
        };
    }
}

const dependencies = Container.init();
export { Container };
export default dependencies;
