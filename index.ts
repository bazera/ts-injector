import 'reflect-metadata';

const Component = () => {
  return (target) => {};
};

const Injectable = () => {
  return (target) => {};
};

class ApiService {}

@Injectable()
class LoggerService {
  constructor(public apiService: ApiService) {}
}

class FakeLoggerService {}

@Injectable()
class CommentService {
  constructor(public loggerService: LoggerService) {}
}

@Injectable()
class UserService {
  constructor(public loggerService: LoggerService) {}
}

@Component()
class AppComponent {
  constructor(
    public userService: UserService,
    public commentService: CommentService,
    private apiService: ApiService
  ) {}
}

interface Provider {
  provide: any;
  useFactory?: () => any;
  useClass?: any;
}

const providers: Provider[] = [
  {
    provide: CommentService,
    useClass: CommentService,
  },
];

class Injector {
  resolve<T>(target): T {
    const tokens: any[] = Reflect.getMetadata('design:paramtypes', target);

    if (tokens?.length) {
      const injections = tokens.map((token) => {
        const provider = providers.find((x) => x.provide === token);

        const injector = new Injector();

        if (!provider) {
          return injector.resolve(token);
        }

        if (provider.useClass) {
          return injector.resolve(provider.useClass);
        }

        if (provider.useFactory) {
          return provider.useFactory();
        }
      });

      return new target(...injections);
    }

    return new target();
  }
}

const injector = new Injector();
const app = injector.resolve<AppComponent>(AppComponent);

console.log('**', app);
