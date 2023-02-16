*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           widget:forcegraph    source:widget


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}widget-source


*** Test Cases ***
Forces
    Example Should Restart-and-Run-All    ${WIDGET_SOURCE}
