import React, {useEffect,useState,ChangeEvent, FormEvent} from 'react';
import {Link , useHistory} from 'react-router-dom'
import logo from '../../assets/logo.svg'
import { Map, Marker,  TileLayer } from 'react-leaflet' 
import { FiArrowLeft } from 'react-icons/fi'
import { LeafletMouseEvent} from 'leaflet'
import './styles.css'
import api from '../../services/api'
import axios from 'axios'
import Dropzone from '../../Componentes/Dropzone'

interface item {
    id:number,
    title:string,
    image_url:string
}

interface IBGEUFResponse{
    sigla:string
}

interface IBGECityResponse{
    nome:string
}

const CreatePoint =() => {
    const [selectedFile,setSelectedFile] = useState<File>()
    const[selectedItems,setSelectedItems]= useState<number[]>([])
    const[items,setItems] = useState<item[]>([]);
    const[UFs,setUFs] = useState<string[]>([]);
    const[selectedUF,setSelectedUF] = useState<string>("0");
    const[cidades,setCidades] = useState<string[]>([]);
    const[selectedCity,setSelectedCity] = useState<string>("0");
    const[selectedPosition,setSelectedPosition] = useState<[number,number]>([0,0]);
    const[initialPosition,setInitialPosition] = useState<[number,number]>([0,0]);
    const[formData,setFormData] = useState({
        name:'',
        email: '',
        whatsapp:'',
    });
    
const History = useHistory()
    
    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position => {
            setInitialPosition([position.coords.latitude,position.coords.longitude])
        })
    },[])

    useEffect(()=>{
        api.get('items').then(response =>{
            setItems(response.data)
        })
    },[])

    useEffect(()=>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{
            const UFInitials = response.data.map(uf=> uf.sigla);
            setUFs(UFInitials);
        })
    },[])

    useEffect(()=>{

        if (selectedUF === "0"){
            return ;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response =>{
            const CityNames = response.data.map(city=> city.nome);
            setCidades(CityNames);
        })
    },[selectedUF])

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUF(uf);
    }
    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event:LeafletMouseEvent){
        setSelectedPosition([event.latlng.lat,event.latlng.lng]) 
    }
    
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name,value} = event.target;
        setFormData({...formData,[name]:value})
    }

    function handleSelectItem(id:number){
        const alredSelected = selectedItems.findIndex(item => item === id);
        if(alredSelected>=0){
            const filteredItems = selectedItems.filter(item =>item !== id);
            setSelectedItems(filteredItems)
        }else{
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleSubmit(event:FormEvent){
        event.preventDefault();
        const {name,email,whatsapp} = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude,longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();
        data.append('name',name);
        data.append('email',email);
        data.append('whatsapp',whatsapp);
        data.append('uf',uf);
        data.append('city',city);
        data.append('latitude',String(latitude));
        data.append('longitude',String(longitude));
        data.append('items',items.join(','));
        if(selectedFile){
            data.append('image',selectedFile);
        }


        // const data = {
        //     name,
        //     email,
        //     whatsapp,
        //     uf,
        //     city,
        //     latitude,
        //     longitude,
        //     items
        // };
        await api.post('points',data);
        alert('Ponto de coleta Salvo');
        History.push('/');


    }

    function Debug(){

        
    }
    return (
      <div id="page-create-point">
          <header>
              <img src={logo}></img>

              <Link to="/">
                  <FiArrowLeft/>
                  Voltar para Home 
              </Link>
          </header>

          <form onSubmit={handleSubmit}>
              <h1>Cadastro do ponto de coleta</h1>
              <Dropzone onFileUploaded={setSelectedFile}/>
              <fieldset>
                  <legend>
                      <h2>Dados</h2>
                  </legend>
                    <div className="field">
                        <label htmlFor="name"> Nome da Entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}></input>
                    </div>
              </fieldset>
              <fieldset>
                <div className="field-group">
                    <div className="field">
                        <label htmlFor="email"> E-mail</label>
                        <input type="email" name="email" id="email" onChange={handleInputChange}></input>
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp">whatsapp</label>
                        <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}></input>
                    </div>
                </div>  
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa </span>
                    </legend>
                    }
                    <Map center={initialPosition}  zoom={15} onClick={ handleMapClick} >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"/>
                        <Marker  position={selectedPosition}  />
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUF}>
                                <option value="0">Selecione uma UF</option>
                                {
                                    UFs.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city"   value={selectedCity} onChange={handleSelectCity} >
                                <option value="0">Selecione uma Cidade</option>
                                
                                {
                                    cidades.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo </span>
                    </legend>
                    <ul className="items-grid">
                        {
                            items.map(item =>(
                                <li 
                                    key={item.id} 
                                    className={selectedItems.includes(item.id)? 'selected':''}
                                    onClick={() =>  handleSelectItem(item.id)}>
                                    <img src={item.image_url} alt={item.title}/>
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }
                        
                    </ul>
                </fieldset>     
                <button type="submit"  >Cadastrar ponto de coleta</button>  
                <span onClick={Debug}>Debug</span>
          </form>
      </div>  
    );
};
export default CreatePoint;
