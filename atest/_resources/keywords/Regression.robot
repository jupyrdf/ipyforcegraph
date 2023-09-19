*** Settings ***
Documentation       Keywords for tests against python fixtures describing regressions.

Resource            ./IPyForceGraph.robot
Library             Collections


*** Keywords ***
Prepare Regression Test
    [Documentation]    Prepare a single regression test case
    [Arguments]    ${gh_issue}
    ${screens} =    Set Variable    ${SCREENS ROOT}${/}regression${/}${gh_issue}
    Set Screenshot Directory    ${screens}
    Initialize Coverage Kernel    ${FAKE_HOME}    regression-${gh_issue}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}regression${/}${gh_issue}.py
    ${files} =    Get All IPyForceGraph Data Paths
    Copy Support Files    ${files}    ${/}datasets${/}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-source.png
    RETURN    ${screens}
