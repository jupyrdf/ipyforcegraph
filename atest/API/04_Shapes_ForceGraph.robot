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
ForceGraph Can Update Text Fill
    Shape Feature Works As Expected    ForceGraph    Text    fill

ForceGraph Can Update Text Background
    Shape Feature Works As Expected    ForceGraph    Text    background

ForceGraph Can Update Text Stroke
    Shape Feature Works As Expected    ForceGraph    Text    stroke

ForceGraph Can Update Ellipse Fill
    Shape Feature Works As Expected    ForceGraph    Ellipse    fill

ForceGraph Can Update Ellipse Stroke
    Shape Feature Works As Expected    ForceGraph    Ellipse    stroke

ForceGraph Can Update Rectangle Fill
    Shape Feature Works As Expected    ForceGraph    Rectangle    fill

ForceGraph Can Update Rectangle Stroke
    Shape Feature Works As Expected    ForceGraph    Rectangle    stroke


*** Keywords ***
Shape Feature Works As Expected
    [Arguments]    ${widget_class}    ${shape_class}    ${feature}
    ${screens} =    Set Variable    ${SCREENS}${/}${widget_class.lower()}${/}${shape_class.lower()}${/}${feature}
    Maybe Skip A Test    widget_class=${widget_class}    feature=${feature}    shape_class=${shape_class}
    Set Screenshot Directory    ${screens}
    Set Up Shape Example    ${widget_class}    ${shape_class}    ${feature}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${transparent} =    Get Element Screenshot Size    ${frame}    ${screens}    01-transparent.png
    Update Shape Feature    ${widget_class}    ${shape_class}    ${feature}
    ${color} =    Get Element Screenshot Size    ${frame}    ${screens}    02-color.png
    Should Be True Or Screenshot    ${color} > ${transparent}    03-color-bigger-than-transparent.png
    [Teardown]    Clean Up Shape Example

Update Shape Feature
    [Arguments]    ${widget_class}    ${shape_class}    ${feature}
    Add And Run JupyterLab Code Cell    shape.${feature} = "rgb(255,0,0)"
    IF    "${shape_class}" == "Rectangle"
        Add And Run JupyterLab Code Cell    shape.opacity = 1
    END
    Wait For All Cells To Run
    Sleep    1s

Set Up Shape Example
    [Arguments]    ${widget_class}    ${shape_class}    ${feature}
    Set Tags    feature:${feature}    widget:${widget_class.lower()}    shape:${shape_class.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}NodeShapes.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    ${text} =    Set Variable    ${text.replace("SHAPE_CLASS", "${shape_class}")}
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
