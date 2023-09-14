*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           widget:forcegraph    source:scales


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}scales


*** Test Cases ***
Scales
    Example Should Restart-and-Run-All    ${SCALES}
