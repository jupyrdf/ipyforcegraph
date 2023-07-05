*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Resource            ../_resources/keywords/Regression.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           regression    gh:90    data:blocks


*** Test Cases ***
Numeric ID Ordering Is Preserved
    [Documentation]    Numeric ID ordering should be preseved.
    Prepare Regression Test    gh-90
    Add And Run JupyterLab Code Cell    task \= asyncio.create_task(test_async())
    Sleep    0.5s
    Add And Run JupyterLab Code Cell    task.result()
    Page Should Not Contain Standard Errors
    Capture Page Screenshot    01-no-errors.png
