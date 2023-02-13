*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           data:miserables    widget:forcegraph    behavior:forces


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}forces


*** Test Cases ***
Forces
    Example Should Restart-and-Run-All    ${FORCES}

Forces Test
    Example Should Restart-and-Run-All    ${FORCES_TEST}
    Wait Until Page Contains    Tests Completed    timeout=120s
    Page Should Not Contain    💥
