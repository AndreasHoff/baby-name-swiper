import React from 'react';

// Testing unused detection
const unusedVariable = 'test';

export const TestComponent: React.FC = () => {
    const anotherUnusedVar = 'unused';

    return <div>Test</div>;
};

function unusedFunction() {
    console.log('This should be caught');
}
