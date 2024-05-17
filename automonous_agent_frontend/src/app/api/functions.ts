"use client"

import { baseAPIurl } from './config';


export interface IParameter {
  name : string
  description : string
  optional : boolean
  data_type : string
}

export interface IFunction {
  function_name : string
  num_parameters? : number
  parameters : IParameter[]
}

export interface IFunctionParameter{
    name : string
    description : string
    optional : boolean
    data_type : string
    value : number
}

export const fetchFunctions = async () : Promise<IFunction[]> => {
  const res = await fetch(`${baseAPIurl}/functions/`)
  if (!res.ok) {
    throw new Error('Agents Fetch Operation failed: Network Error');
  }
  const data = await res.json();
  return data;
};
