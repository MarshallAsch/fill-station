import { Client } from "@/redux/client/clientSlice";
import axios from "axios";


export async function getAllClients(): Promise<Client[]> {
  let result = await axios.get('/api/clients')

  return result.data;
}
