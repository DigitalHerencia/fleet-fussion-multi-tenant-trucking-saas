import { faker } from '@faker-js/faker';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  dotNumber: string;
  mcNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    email: `testuser+${timestamp}@fleetfusion-test.dev`,
    password: 'TestPassword123!@#',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    companyName: `${faker.company.name()} Trucking`,
    dotNumber: `DOT${faker.number.int({ min: 1000000, max: 9999999 })}`,
    mcNumber: `MC${faker.number.int({ min: 100000, max: 999999 })}`,
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zip: faker.location.zipCode(),
    phone: faker.phone.number(),
  };
}

export const testUsers = {
  admin: generateTestUser(),
  dispatcher: generateTestUser(),
  driver: generateTestUser(),
  temp: generateTestUser(), // For one-off tests
};