*** Settings ***
Library     OperatingSystem
Library     Process
Library     String
Library     Collections
Resource    Lab.robot
Resource    Browser.robot
Resource    ../variables/Server.robot
Resource    Coverage.robot


*** Variables ***
${JUPYTERLAB_EXE}           jupyter-lab
${TOTAL_COVERAGE}           0
${CALLER_ID}                0000
${PABOTQUEUEINDEX}          0
${PABOTEXECUTIONPOOLID}     0

# paths relative to home
${DOT_LOCAL_PATH}           .local
${ETC_PATH}                 ${DOT_LOCAL_PATH}${/}etc${/}jupyter
${SHARE_PATH}               ${DOT_LOCAL_PATH}${/}share${/}jupyter
${KERNELS_PATH}             ${SHARE_PATH}${/}kernels
${USER_SETTINGS_PATH}       ${ETC_PATH}${/}lab${/}user-settings
${NB_PATH}                  nb


*** Keywords ***
Setup Server and Browser
    [Documentation]    Custom invocation of jupyter-server
    ${home_dir} =    Initialize Fake Home
    Initialize Jupyter Paths    ${home_dir}
    ${lab} =    Initialize Jupyter Server    ${home_dir}
    Open JupyterLab
    Set Window Size    1920    1080

Tear Down Everything
    IF    ${TOTAL_COVERAGE}    Capture Page Coverage
    Close All Browsers
    Run Keyword and Ignore Error    Terminate All Jupyter Servers

Initialize Fake Home
    ${home_dir} =    Set Variable    ${OUTPUT_DIR}${/}.home
    Create Directory    ${home_dir}
    Set Suite Variable    ${FAKE_HOME}    ${home_dir}    children=${TRUE}
    RETURN    ${home_dir}

Initialize Jupyter Paths
    [Documentation]    Configure the settings directory, and modify settings that make tests less reproducible
    [Arguments]    ${home_dir}
    ${nb_dir} =    Set Variable    ${home_dir}${/}${NB_PATH}
    ${dot_local} =    Set Variable    ${home_dir}${/}${DOT_LOCAL_PATH}
    ${etc_dir} =    Set Variable    ${home_dir}${/}${ETC_PATH}
    Create Directory    ${nb_dir}
    Create Directory    ${etc_dir}
    Copy File    ${IPYFORCEGRAPH_FIXTURES}${/}${NBSERVER CONF}    ${etc_dir}${/}${NBSERVER CONF}
    Copy File    ${IPYFORCEGRAPH_FIXTURES}${/}${SETTINGS_DEFAULTS}    ${etc_dir}${/}labconfig${/}${SETTINGS_DEFAULTS}
    Initialize Coverage Kernel    ${home_dir}

Initialize Coverage Kernel
    [Documentation]    Copy and patch the env kernel to run under coverage.
    [Arguments]    ${home_dir}    ${context}=atest-${PABOTQUEUEINDEX}-${PABOTEXECUTIONPOOLID}-${CALLER_ID}
    IF    not ${TOTAL_COVERAGE}    RETURN    ${NONE}
    ${kernels_dir} =    Set Variable    ${home_dir}${/}${KERNELS_PATH}
    ${spec_dir} =    Set Variable    ${kernels_dir}${/}python3
    Remove Directory    ${kernels_dir}    recursive=${TRUE}
    Create Directory    ${kernels_dir}
    Copy Directory    %{CONDA_PREFIX}${/}share${/}jupyter${/}kernels${/}python3    ${spec_dir}
    ${spec_path} =    Set Variable    ${spec_dir}${/}kernel.json
    ${spec_text} =    Get File    ${spec_path}
    ${spec_json} =    Loads    ${spec_text}
    ${cov_path} =    Set Variable    ${OUTPUT_DIR}${/}pycov
    Create Directory    ${cov_path}
    ${rest} =    Get Slice From List    ${spec_json["argv"]}    1
    ${argv} =    Create List
    ...    ${spec_json["argv"][0]}
    ...    -m
    ...    coverage    run
    ...    --parallel-mode
    ...    --branch
    ...    --source    ipyforcegraph
    ...    --context    ${context}-${OS.lower()}
    ...    --concurrency    thread
    ...    --data-file    ${cov_path}${/}.coverage
    ...    @{rest}
    Set To Dictionary    ${spec_json}    argv=${argv}
    ${spec_text} =    Dumps    ${spec_json}    indent=${2}    sort_keys=${TRUE}
    Log    ${spec_text}
    Create File    ${spec_path}    ${spec_text}
    RETURN    ${spec_path}

Initialize Jupyter Server
    [Documentation]    Set up server with command as defined in atest.py.
    [Arguments]    ${home_dir}
    ${notebook_dir} =    Set Variable    ${home_dir}${/}${NB_PATH}
    ${port} =    Get Unused Port
    ${token} =    Generate Random String    64
    ${base url} =    Set Variable    /ipy@rf@g/
    @{args} =    Build Custom JupyterLab Args    ${port}    ${token}    ${base url}
    ${rest_args} =    Get Slice From List    ${args}    1
    &{config} =    Create Dictionary
    ...    stdout=${OUTPUT DIR}${/}lab.log
    ...    stderr=STDOUT
    ...    cwd=${notebook_dir}
    ...    env:HOME=${home_dir}
    ...    env:JUPYTER_CONFIG_DIR=${home_dir}${/}${ETC_PATH}
    ...    env:JUPYTER_PREFER_ENV_PATH=0
    ${lab} =    Start New Jupyter Server
    ...    ${args[0]}
    ...    ${port}
    ...    ${base url}
    ...    ${notebook dir}
    ...    ${token}
    ...    @{rest_args}
    ...    &{config}
    Wait For Jupyter Server To Be Ready    ${lab}
    RETURN    ${lab}

Build Custom JupyterLab Args
    [Documentation]    Generate some args
    [Arguments]    ${port}    ${token}    ${base url}
    ${args} =    Loads    ${JUPYTERLAB_EXE}
    @{args} =    Set Variable
    ...    @{args}
    ...    --no-browser
    ...    --debug
    ...    --expose-app-in-browser
    ...    --port\=${port}
    ...    --ServerApp.token\=${token}
    ...    --ServerApp.base_url\=${base url}
    Log    ${args}
    RETURN    @{args}
