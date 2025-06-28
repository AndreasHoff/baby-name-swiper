import React from 'react';

// This is a test file to verify linting works
const unusedVariable = 'test';

export const TestComponent: React.FC = () => {
    const anotherUnusedVar = 'unused';

    return <div>Test</div>;
};

// Unused function
function unusedFunction() {
    console.log('This function is not used');
}
