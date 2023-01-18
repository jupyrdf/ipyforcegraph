*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}3d


*** Test Cases ***
3D
    [Tags]    data:miserables    widget:forcegraph3d
    Example Should Restart-and-Run-All    ${THREEDEE}
