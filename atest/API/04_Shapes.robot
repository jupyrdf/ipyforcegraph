*** Settings ***
Resource        ../_resources/keywords/Server.robot
Resource        ../_resources/keywords/Browser.robot
Resource        ../_resources/keywords/Lab.robot
Resource        ../_resources/keywords/IPyForceGraph.robot
Resource        ../_resources/keywords/Screenshots.robot
Library         Collections
Library         JupyterLibrary
Library         OperatingSystem

Force Tags      suite:shapes


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api${/}shapes


*** Test Cases ***
ForceGraph Can Update fill
    Shape Feature Works As Expected    ForceGraph    fill

ForceGraph Can Update background
    Shape Feature Works As Expected    ForceGraph    background

ForceGraph Can Update stroke
    Shape Feature Works As Expected    ForceGraph    stroke

ForceGraph3D Can Update fill
    Shape Feature Works As Expected    ForceGraph3D    fill

ForceGraph3D Can Update background
    Shape Feature Works As Expected    ForceGraph3D    background

ForceGraph3D Can Update stroke
    Shape Feature Works As Expected    ForceGraph3D    stroke


*** Keywords ***
Shape Feature Works As Expected
    [Arguments]    ${widget_class}    ${feature}
    ${screens} =    Set Variable    ${SCREENS}${/}${widget_class.lower()}_${feature}
    Maybe Skip A Test    widget_class=${widget_class}    feature=${feature}
    Set Screenshot Directory    ${screens}
    Set Up Shape Example    ${feature}    ${widget_class}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${transparent} =    Get Element Screenshot Size    ${frame}    ${screens}    01-transparent.png
    Add And Run JupyterLab Code Cell
    ...    shape.${feature} = "rgba(255, 0, 0, 1.0)"
    Wait For All Cells To Run
    Sleep    1s
    ${color} =    Get Element Screenshot Size    ${frame}    ${screens}    02-color.png
    Should Be True Or Screenshot    ${color} > ${transparent}    03-color-bigger-than-transparent.png
    [Teardown]    Clean Up Shape Example

Set Up Shape Example
    [Arguments]    ${feature}    ${widget_class}
    Set Tags    feature:${feature}    widget:${widget_class.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}NodeShapes.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    ${text} =    Set Variable    ${text.replace("FEATURE", "${feature}")}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Clean Up Shape Example
    Capture Page Screenshot    99-fin.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
