*** Settings ***
Resource        ../_resources/keywords/Server.robot
Resource        ../_resources/keywords/Browser.robot
Resource        ../_resources/keywords/Lab.robot
Resource        ../_resources/keywords/IPyForceGraph.robot
Resource        ../_resources/keywords/Screenshots.robot
Library         Collections
Library         JupyterLibrary
Library         OperatingSystem

Force Tags      suite:link-shapes2


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api${/}links-shapes2


*** Test Cases ***
ForceGraph3D Can Update Text Fill
    Link Shape Feature Works As Expected    ForceGraph3D    Text    fill

ForceGraph3D Can Update Text Background
    Link Shape Feature Works As Expected    ForceGraph3D    Text    background

ForceGraph3D Can Update Text Stroke
    Link Shape Feature Works As Expected    ForceGraph3D    Text    stroke


*** Keywords ***
Link Shape Feature Works As Expected
    [Arguments]    ${widget_class}    ${shape_class}    ${feature}
    ${screens} =    Set Variable    ${SCREENS}${/}${widget_class.lower()}${/}${shape_class.lower()}${/}${feature}
    Maybe Skip A Test    widget_class=${widget_class}    feature=${feature}    shape_class=${shape_class}
    Set Screenshot Directory    ${screens}
    Set Up Link Shape Example    ${widget_class}    ${shape_class}    ${feature}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${transparent} =    Get Element Screenshot Size    ${frame}    ${screens}    01-transparent.png
    Update Link Shape Feature    ${widget_class}    ${shape_class}    ${feature}
    ${color} =    Get Element Screenshot Size    ${frame}    ${screens}    02-color.png
    Should Be True Or Screenshot    ${color} > ${transparent}    03-color-bigger-than-transparent.png
    [Teardown]    Clean Up Link Shape Example

Update Link Shape Feature
    [Arguments]    ${widget_class}    ${shape_class}    ${feature}
    Add And Run JupyterLab Code Cell    shape.${feature} = "rgb(255,0,0)"
    Wait For All Cells To Run
    Sleep    1s

Set Up Link Shape Example
    [Arguments]    ${widget_class}    ${shape_class}    ${feature}
    Set Tags    feature:${feature}    widget:${widget_class.lower()}    shape:${shape_class.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}LinkShapes2.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    ${text} =    Set Variable    ${text.replace("SHAPE_CLASS", "${shape_class}")}
    ${text} =    Set Variable    ${text.replace("FEATURE", "${feature}")}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Clean Up Link Shape Example
    Capture Page Screenshot    99-fin.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
