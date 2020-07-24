import {  useReducer, useEffect  } from 'react';
import axios from 'axios';

const baseUrl = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json?search=node';
const actions = {
    makeRequest: 'make-request',
    getData: 'get-data',
    error: 'error'
};

function reducer(state, action) {
    switch(action.type) {
        case actions.makeRequest:
            return {  loading: true, jobs: []  }

        case actions.getData: 
            return {  ...state, loading: false, jobs: action.payload.jobs  }

        case actions.error: 
            return {  ...state, loading: false, error: action.payload.error, jobs: []  }

        default: return state
    }
}

export default function useFetchJobs (listOfParameters, pageNumber) {
    const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true });

    useEffect(() => {
        const cancelToken = axios.CancelToken.source();

        dispatch({ type: actions.makeRequest });
        axios.get(baseUrl, {
            cancelToken: cancelToken.token,
            listOfParameters: {  markdown: true, page: pageNumber, ...listOfParameters  }
        }).then(res => {
            dispatch({  type: actions.getData, payload: {  jobs: res.data  }  })
        }).catch (e => {
            if (axios.isCancel(e)) return; 
            dispatch({  type: actions.error, payload: {  error: e  }  })
        })

        return () => {
            cancelToken.cancel(); 
        }
    }, [listOfParameters, pageNumber])

    return state
}