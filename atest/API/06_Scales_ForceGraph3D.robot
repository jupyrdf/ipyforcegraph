*** Settings ***
Resource        ../_resources/keywords/Server.robot
Resource        ../_resources/keywords/Browser.robot
Resource        ../_resources/keywords/Lab.robot
Resource        ../_resources/keywords/IPyForceGraph.robot
Resource        ../_resources/keywords/Screenshots.robot
Library         Collections
Library         JupyterLibrary
Library         OperatingSystem
Library         ../_libraries/Colors.py

Force Tags      suite:scales


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api


*** Test Cases ***
ContinuousColor Can Update ForceGraph3D Nodes
    Scale Works As Expected    ForceGraph3D    ContinuousColor    viridis

OrdinalColor Can Update ForceGraph3D Nodes
    Scale Works As Expected    ForceGraph3D    OrdinalColor    category10


*** Keywords ***
Scale Works As Expected
    [Arguments]    ${widget_class}    ${scale_class}    ${scheme}
    ${screens} =    Set Variable    ${SCREENS}${/}${widget_class.lower()}_${scale_class.lower()}
    Maybe Skip A Test    widget_class=${widget_class}    feature=${scale_class}
    Set Screenshot Directory    ${screens}
    Set Up Scale Example    ${widget_class}    ${scale_class}    ${scheme}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${transparent} =    Get Element Screenshot Size    ${frame}    ${screens}    01-transparent.png
    Adjust Scale    ${frame}    ${screens}    ${transparent}    ${EMPTY}    02-scale
    ...    ns.color = scale
    Adjust Scale    ${frame}    ${screens}    ${transparent}    02-scale    03-colorize
    ...    ns.color = colorize
    Adjust Scale    ${frame}    ${screens}    ${transparent}    03-colorize    04-tint
    ...    ns.color = tint
    [Teardown]    Clean Up Scale Example

Adjust Scale
    [Arguments]    ${frame}    ${screens}    ${transparent}    ${old_colors}    ${screen_name}    ${code}
    Add And Run JupyterLab Code Cell    ${code}
    Wait For All Cells To Run
    Sleep    2s
    ${screen_size} =    Get Element Screenshot Size    ${frame}    ${screens}    ${screen_name}.png
    Should Be True Or Screenshot    ${screen_size} > ${transparent}    ${screen_name}-bigger-than-transparent.png
    IF    "${old_colors}"
        Color Palettes Should Be_Different
        ...    ${screens}${/}${old_colors}.png
        ...    ${screens}${/}${screen_name}.png
    END

Set Up Scale Example
    [Arguments]    ${widget_class}    ${scale_class}    ${scheme}
    Set Tags    scale:${scale_class}    widget:${widget_class.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}Scales.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    ${text} =    Set Variable    ${text.replace("SCALE_CLASS", "${scale_class}")}
    ${text} =    Set Variable    ${text.replace("SCHEME", "${scheme}")}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Clean Up Scale Example
    Capture Page Screenshot    99-fin.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
