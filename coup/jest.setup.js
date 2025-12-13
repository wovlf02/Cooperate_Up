import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    study: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    studyMember: {
      findMany: jest.fn(),
    },
    report: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    systemSettings: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    adminRole: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock PrismaClient constructor
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      study: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      studyMember: {
        findMany: jest.fn(),
      },
      report: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      systemSettings: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
      adminRole: {
        findUnique: jest.fn(),
      },
    }))
  };
});

// Mock fs/promises
jest.mock('fs/promises', () => ({
  unlink: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Next.js Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/test',
}));

// Mock next-auth/react for client components
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}));

// Mock Next.js Request/Response for API routes
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
    this._body = options.body;
  }

  async json() {
    return JSON.parse(this._body || '{}');
  }

  async text() {
    return this._body || '';
  }
};

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }
};

// Mock Headers
global.Headers = class Headers extends Map {
  constructor(init) {
    super(Object.entries(init || {}));
  }

  get(name) {
    return super.get(name.toLowerCase());
  }

  set(name, value) {
    super.set(name.toLowerCase(), value);
  }
};

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init = {}) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers,
        },
      });
    },
    next: () => new Response(null, { status: 200 }),
  },
}));

// Mock window objects (jsdom 환경에서만)
if (typeof window !== 'undefined') {
  // Mock window.confirm
  global.confirm = jest.fn(() => true);

  // Mock window.location.reload safely
  try {
    delete window.location;
    window.location = { reload: jest.fn(), href: '' };
  } catch (e) {
    // Ignore errors in read-only location
  }
}

// Mock console to avoid noisy test output (but keep console.log and console.error for debugging)
const originalInfo = console.info;
const originalWarn = console.warn;

beforeAll(() => {
  console.info = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.info = originalInfo;
  console.warn = originalWarn;
});
