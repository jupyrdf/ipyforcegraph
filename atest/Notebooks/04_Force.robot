*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}forces


*** Test Cases ***
Forces
    [Tags]    data:miserables    widget:forcegraph    behavior:forces
    Example Should Restart-and-Run-All    ${FORCES}

Forces Test
    [Tags]    data:miserables    widget:forcegraph    behavior:forces
    Example Should Restart-and-Run-All    ${FORCES_TEST}
    Wait Until Page Contains    ✅✅✅    timeout=180s
