*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}behaviors


*** Test Cases ***
Behaviors
    [Tags]    data:miserables    lib:force-graph
    Example Should Restart-and-Run-All    ${BEHAVIORS}
