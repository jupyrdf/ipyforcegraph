*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Library             Collections

Test Teardown       Clean up after IPyForcegraph Example


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}notebook-examples
