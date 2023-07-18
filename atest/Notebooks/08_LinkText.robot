*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           widget:forcegraph    source:link-text


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}link-text


*** Test Cases ***
LinkText
    Example Should Restart-and-Run-All    ${LINK_TEXT}
