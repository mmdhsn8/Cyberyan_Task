type TestCase = {
  name: string;
  run: () => Promise<void> | void;
};

const tests: TestCase[] = [];

export const addTest = (name: string, run: TestCase['run']) => {
  tests.push({ name, run });
};

export const runAllTests = async () => {
  let failed = 0;

  for (const testCase of tests) {
    try {
      await testCase.run();
      console.log(`PASS ${testCase.name}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${testCase.name}`);
      console.error(error);
    }
  }

  if (failed > 0) {
    process.exitCode = 1;
    console.error(`\n${failed} test(s) failed.`);
    return;
  }

  console.log(`\nAll ${tests.length} backend tests passed.`);
};
