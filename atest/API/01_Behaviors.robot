*** Settings ***
Resource            ../_resources/keywords/Server.robot
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections
Library             JupyterLibrary
Library             OperatingSystem

Test Teardown       Clean Up API Example


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api


*** Test Cases ***
Node Select
    [Tags]    lib:force-graph
    [Setup]    Set Up API Example    node_selection
    Wait Until JupyterLab Kernel Is Idle
    Log    TODO: test selection
    Capture Page Screenshot    99-fin.png

Node Labels
    [Tags]    lib:force-graph
    [Setup]    Set Up API Example    node_labels
    Log    TODO: test label on hover
    Capture Page Screenshot    99-fin.png


*** Keywords ***
Set Up API Example
    [Arguments]    ${example}
    Set Tags    api:${example}
    Set Screenshot Directory    ${SCREENS}${/}${example}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}${example}.py
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text}
    Execute JupyterLab Command    Run All Cells
    Wait Until JupyterLab Kernel Is Idle

Clean Up API Example
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
