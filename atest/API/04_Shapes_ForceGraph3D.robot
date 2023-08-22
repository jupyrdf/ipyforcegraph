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
ForceGraph3D Can Update Text Fill
    Shape Feature Works As Expected    ForceGraph3D    Text    fill

ForceGraph3D Can Update Text Background
    Shape Feature Works As Expected    ForceGraph3D    Text    background

ForceGraph3D Can Update Text Stroke
    Shape Feature Works As Expected    ForceGraph3D    Text    stroke

ForceGraph3D Can Update Ellipse Fill
    Shape Feature Works As Expected    ForceGraph3D    Ellipse    fill

ForceGraph3D Can Update Ellipse Stroke
    Shape Feature Works As Expected    ForceGraph3D    Ellipse    stroke

ForceGraph3D Can Update Rectangle Fill
    Shape Feature Works As Expected    ForceGraph3D    Rectangle    fill

ForceGraph3D Can Update Rectangle Stroke
    Shape Feature Works As Expected    ForceGraph3D    Rectangle    stroke


*** Keywords ***
Shape Feature Works As Expected
    [Arguments]    ${widget_class}    ${shape_class}    ${feature}
    ${screens} =    Set Variable    ${SCREENS}${/}${widget_class.lower()}${/}${shape_class.lower()}${/}${feature}
    Maybe Skip A Test    widget_class=${widget_class}    feature=${feature}    shape_class=${shape_class}
    Set Screenshot Directory    ${screens}
    Set Up Shape Example    ${widget_class}    ${shape_class}    ${feature}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${transparent} =    Get Element Screenshot Size    ${frame}    ${screens}    01-transparent.png

    # ${color} =    Get Element Screenshot Size    ${frame}    ${screens}    02-color.png
    # Should Be True Or Screenshot    ${color} > ${transparent}    03-color-bigger-than-transparent.png
    A Color Change Should Be Bigger
    ...    ${widget_class}
    ...    ${shape_class}
    ...    ${frame}
    ...    ${screens}
    ...    ${transparent}
    ...    ${feature}
    ...    02-color-rgba
    ...    "rgb(255,0,0)"
    A Color Change Should Be Bigger
    ...    ${widget_class}
    ...    ${shape_class}
    ...    ${frame}
    ...    ${screens}
    ...    ${transparent}
    ...    ${feature}
    ...    03-replace-css-string
    ...    B.ReplaceCssVariables("var(--jp-warn-color0)")
    A Color Change Should Be Bigger
    ...    ${widget_class}
    ...    ${shape_class}
    ...    ${frame}
    ...    ${screens}
    ...    ${transparent}
    ...    ${feature}
    ...    04-replace-css-tmpl
    ...    B.ReplaceCssVariables(B.Nunjucks("var(--jp-brand-color0)"))
    [Teardown]    Clean Up Shape Example

A Color Change Should Be Bigger
    [Arguments]
    ...    ${widget_class}
    ...    ${shape_class}
    ...    ${frame}
    ...    ${screens}
    ...    ${baseline}
    ...    ${feature}
    ...    ${screen}
    ...    ${value}
    Update Shape Feature    ${widget_class}    ${shape_class}    ${feature}    ${value}
    ${changed} =    Get Element Screenshot Size    ${frame}    ${screens}    ${screen}.png
    Should Be True Or Screenshot    ${changed} > ${baseline}    ${screen}-is-bigger.png

Update Shape Feature
    [Arguments]    ${widget_class}    ${shape_class}    ${feature}    ${value}
    Add And Run JupyterLab Code Cell    shape.${feature} = ${value}
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
