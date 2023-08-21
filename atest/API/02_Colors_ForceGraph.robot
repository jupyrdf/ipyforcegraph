*** Settings ***
Resource        ../_resources/keywords/Server.robot
Resource        ../_resources/keywords/Browser.robot
Resource        ../_resources/keywords/Lab.robot
Resource        ../_resources/keywords/IPyForceGraph.robot
Resource        ../_resources/keywords/Screenshots.robot
Library         Collections
Library         JupyterLibrary
Library         OperatingSystem

Force Tags      suite:colors


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api


*** Test Cases ***
ForceGraph Can Update background_color
    Color Feature Works As Expected    ForceGraph    background_color

ForceGraph Can Update default_link_color
    Color Feature Works As Expected    ForceGraph    default_link_color

ForceGraph Can Update default_node_color
    Color Feature Works As Expected    ForceGraph    default_node_color


*** Keywords ***
Color Feature Works As Expected
    [Arguments]    ${widget_class}    ${feature}
    ${screens} =    Set Variable    ${SCREENS}${/}${widget_class.lower()}_${feature}
    Maybe Skip A Test    widget_class=${widget_class}    feature=${feature}
    Set Screenshot Directory    ${screens}
    Set Up Color Example    ${feature}    ${widget_class}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${transparent} =    Get Element Screenshot Size    ${frame}    ${screens}    01-transparent.png
    ${redden} =    Set Variable    fg.${feature} = "rgb(255,0,0)"
    Add And Run JupyterLab Code Cell    ${redden}
    Wait For All Cells To Run
    Sleep    0.5s
    ${color} =    Get Element Screenshot Size    ${frame}    ${screens}    02-color.png
    Should Be True Or Screenshot    ${color} > ${transparent}    03-color-bigger-than-transparent.png
    [Teardown]    Clean Up Color Example

Set Up Color Example
    [Arguments]    ${feature}    ${widget_class}
    Set Tags    feature:${feature}    widget:${widget_class.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}Colors.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    ${text} =    Set Variable    ${text.replace("FEATURE", "${feature}")}
    Log    ${text}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Clean Up Color Example
    Capture Page Screenshot    99-fin.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
