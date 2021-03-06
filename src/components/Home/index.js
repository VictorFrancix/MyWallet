import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
    RiLogoutBoxRLine,
    RiAddCircleLine,
    RiIndeterminateCircleLine,
} from "react-icons/ri";
import styled from "styled-components";
import { useEffect, useContext } from "react";
import Main from "./style";
import UserContext from "./../../assets/Context";

export default function Home() {
    const token = localStorage.getItem("TOKEN");
    const { user, setUser } = useContext(UserContext);

    let total = 0;

    const navigate = useNavigate();

    function logout(token) {
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        const promise = axios.delete("https://projeto-mywallet-api.herokuapp.com/logout", {}, config)

        promise.then(() => {
            localStorage.removeItem("TOKEN");
            setUser({});
            navigate("/");
        }
        )
        promise.catch((err) => {
            console.log(err);
        }
        )
    }
    
    function writeValue(value) {
        let decimals = value % 1;
        let inteiros = (value - decimals).toString();
        let inteirosLabel = "";
        for (let i = 1; i <= inteiros.length; i++) {
            if ((i-1) % 3 === 0 && i>1) {inteirosLabel = "." + inteirosLabel}
            inteirosLabel = inteiros[inteiros.length - i] + inteirosLabel;
        }
        let dec2 = Math.round(decimals*100)
        return "R$" + inteirosLabel + "," + (dec2 < 10 ? "0" : "") + dec2;
    }
    
    if (user.registry) {
        user.registry.forEach((register) => {
            if (register.type === "entry") {
                total += register.value;
            } else if (register.type === "spent") {
                total -= register.value;
            }

        });
    }

    useEffect(() => {
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };
        console.log(token)
        const promise = axios.get("https://projeto-mywallet-api.herokuapp.com/finances", config);
        promise.then((res) => {
            setUser(res.data);
            console.log(user)
        });
        promise.catch((err) => {
            console.log(`${err.response.status} - ${err.response.statusText}`);
            alert("Um erro aconteceu, tente novamente");
            navigate("/");
        });
    }, []);

    return user.name ? (
        <Main color={total > 0 ? "entry" : "spent"}>
            <aside>
                <h1>Ol??, {user.name}</h1>
                <Link to="/">
                {() => logout(token)}
                    <RiLogoutBoxRLine />
                </Link>
            </aside>
            {user.registry.length > 0 ? (
                <section>
                    <article>
                    {user.registry.map((register) => {
                        return (
                            <Container
                                class={register.type}
                                color={register.type}
                            >
                                <p>
                                    <span>{register.date}</span>{" "}
                                    {register.description}
                                </p>
                                <p value = {register.value}class="value">{writeValue(register.value)} </p>
                            </Container>
                        );
                    })}
                    </article>

                    <p>
                        SALDO <span value = {total}> {writeValue(Math.abs(total))}</span>
                    </p>
                </section>
            ) : (
                <section class="empty">
                    <p>N??o h?? registros de entrada ou sa??da</p>
                </section>
            )}

            <div>
                <Link to="/finances/entry">
                    <button>
                        <RiAddCircleLine />
                        <p>Nova entrada</p>
                    </button>
                </Link>
                <Link to="/finances/spent">
                    <button>
                        <RiIndeterminateCircleLine />
                        <p>Nova sa??da</p>
                    </button>
                </Link>
            </div>
        </Main>
    ) : (
        <> </>
    );
}

const Container = styled.div`
    margin-bottom: 20px;

    p span {
        color: var(--ligth-grey);
        margin-right: 5px;
    }
    p.value {
        color: var(--${(props) => props.color});
    }
`;