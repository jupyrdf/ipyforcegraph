*** Settings ***
Resource            ../_resources/keywords/Server.robot
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections
Library             JupyterLibrary
Library             OperatingSystem

Test Teardown       Clean Up Behavior Example


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api


*** Test Cases ***
2D Node Select
    [Setup]    Set Up Behavior Example    NodeSelection    ForceGraph
    Log    TODO: test selection

2D Node Labels
    [Setup]    Set Up Behavior Example    NodeLabels    ForceGraph
    Log    TODO: test label on hover

3D Node Select
    [Setup]    Set Up Behavior Example    NodeSelection    ForceGraph3D
    Log    TODO: test selection

3D Node Labels
    [Setup]    Set Up Behavior Example    NodeLabels    ForceGraph3D
    Log    TODO: test label on hover


*** Keywords ***
Set Up Behavior Example
    [Arguments]    ${behavior}    ${widget_class}
    Set Tags    behavior:${behavior.lower()}    widget:${widget_class.lower()}
    Set Screenshot Directory    ${SCREENS}${/}${widget_class.lower()}_${behavior.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}${behavior}.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Clean Up Behavior Example
    Capture Page Screenshot    99-fin.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
