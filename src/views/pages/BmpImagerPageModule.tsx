import { useSnackbar } from "notistack";
import { ModuleContext } from "../../components/ContextProvider";
import { useProgress } from "../../components/ProgressProvider";


/**
 * useWorkspace
 */
export const useWorkspace = () => {
  console.log('useWorkspace');

  const { setMask } = useProgress();
  /**
   * WorkspaceList: workspace list
   */
  const getWorkspaces = (userId: string) => {
    console.log('getWorkspaces', userId);
    setMask();
  }

  /**
   * WorkspaceList: refresh
   */
  const refreshWorkspaces = (userId: string) => {
    console.log('refreshWorkspace');
    getWorkspaces(userId);
  }

  return ({
    getWorkspaces,
    refreshWorkspaces,
  });
}



/**
* error handler
*/
const useHandleError = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleError = (error: any) => {
    console.log('handleError', error);
    console.log('handleError', error.response);
    if (error?.response?.status === 401) {
      //history.push('/signin');
    }
    const msg = error?.response?.data?.message || error?.message;
    msg && enqueueSnackbar(msg, { variant: 'error' });
    throw error;
  }
  return { handleError }
}


/**
 * WorkspaceProvider
 */
export const WorkspaceContext = ModuleContext(useWorkspace);
export const useWorkspaceModule = WorkspaceContext.useContext;

