*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           widget:forcegraph    source:wrappers


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}wrappers


*** Test Cases ***
Wrappers
    Example Should Restart-and-Run-All    ${WRAPPERS}
