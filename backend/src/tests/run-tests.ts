import { runAllTests } from './harness';
import './utils/faker.util.test';
import './modules/identity.service.test';
import './modules/auth.service.test';
import './modules/audit.service.test';

runAllTests().catch(error => {
  console.error('Unexpected test runner failure.');
  console.error(error);
  process.exitCode = 1;
});
