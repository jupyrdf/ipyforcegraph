*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           widget:forcegraph    source:dodo


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}dodo-source


*** Test Cases ***
DodoSource
    Example Should Restart-and-Run-All    ${DODO_SOURCE}
