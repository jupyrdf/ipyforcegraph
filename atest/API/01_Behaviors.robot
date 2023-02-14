*** Settings ***
Resource            ../_resources/keywords/Server.robot
Resource            ../_resources/keywords/Browser.robot
Resource            ../_resources/keywords/Lab.robot
Resource            ../_resources/keywords/IPyForceGraph.robot
Library             Collections
Library             JupyterLibrary
Library             OperatingSystem

Test Teardown       Clean Up Behavior Example

Force Tags          suite:behaviors


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api


*** Test Cases ***
2D Node Select
    [Setup]    Set Up Behavior Example    NodeSelection    ${IPYFORCEGRAPH CLASS}
    Click IPyForceGraph Canvas
    Wait Until Tag Widget Exists    hello world
    Remove Widget Tag
    Wait Until No Tag Widgets Exist

2D Link Select
    [Setup]    Set Up Behavior Example    LinkSelection    ${IPYFORCEGRAPH CLASS}
    Click IPyForceGraph Canvas
    Wait Until Tag Widget Exists    0
    Remove Widget Tag
    Wait Until No Tag Widgets Exist

2D Node Labels
    [Setup]    Set Up Behavior Example    NodeLabels    ${IPYFORCEGRAPH CLASS}
    Click IPyForceGraph Canvas    text=hello world

3D Node Select
    [Setup]    Set Up Behavior Example    NodeSelection    ${IPYFORCEGRAPH CLASS 3D}
    Click IPyForceGraph Canvas
    Wait Until Tag Widget Exists    hello world
    Remove Widget Tag
    Wait Until No Tag Widgets Exist

3D Link Select
    [Setup]    Set Up Behavior Example    LinkSelection    ${IPYFORCEGRAPH CLASS 3D}
    Click IPyForceGraph Canvas
    Wait Until Tag Widget Exists    0
    Remove Widget Tag
    Wait Until No Tag Widgets Exist

3D Node Labels
    [Setup]    Set Up Behavior Example    NodeLabels    ${IPYFORCEGRAPH CLASS 3D}
    Click IPyForceGraph Canvas    text=hello world

2D Graph Data
    [Setup]    Set Up Behavior Example    GraphData    ${IPYFORCEGRAPH CLASS}
    Page Should Not Contain Standard Errors    01-no-errors.png

3D Graph Data
    [Setup]    Set Up Behavior Example    GraphData    ${IPYFORCEGRAPH CLASS 3D}
    Page Should Not Contain Standard Errors    01-no-errors.png


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
