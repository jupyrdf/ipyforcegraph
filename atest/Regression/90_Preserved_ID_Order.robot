*** Settings ***
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections

Test Teardown       Clean up after IPyForceGraph Example

Test Tags           gh:90    data:blocks


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}regression


*** Test Cases ***
Numeric ID Ordering Is Preserved
    [Documentation]    Numeric ID ordering should be preseved.
    Prepare Regression Test    gh-90
    Add And Run JupyterLab Code Cell    task \= asyncio.create_task(test_async())
    Sleep    0.5s
    Add And Run JupyterLab Code Cell    task.result()
    Page Should Not Contain Standard Errors
    Capture Page Screenshot    01-no-errors.png


*** Keywords ***
Prepare Regression Test
    [Documentation]    Prepare a single regression test case
    [Arguments]    ${gh_issue}
    Set Screenshot Directory    ${SCREENS}${/}${gh_issue}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}regression${/}${gh_issue}.py
    ${files} =    Get All IPyForceGraph Data Paths
    Copy Support Files    ${files}    ${/}datasets${/}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-source.png
